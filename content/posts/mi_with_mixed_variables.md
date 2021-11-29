---
title: Mutual information with mixed variables
date: '2021-11-17'
draft: no
bibFile : static/bib.json
---

In many real-life datasets, particularly in medical records of patients,
we might encounter both discrete and continuous variables and want to
measure their interactions, *without favoring one type of variable or
the other*. In other words, the dependency measure should scale with the
signal-to-noise ratio the same way for continuous-continuous,
discrete-discrete or discrete-continuous combinations. In the context of
constraint-based approaches, another layer of difficulty is added as the
same applies for the variables of the conditioning set.

There also exists yet another type of variable that has the
characteristics of both continuous and categorical variables, and fits
neither definition. For example, think of the height measured in
centimeters without decimals : it is not defined on a truly continuous
interval as it has non-zero probability to take certain values, but it
also has too many unique values, which are potentially infinite (but
countable), to be considered discrete. Many estimators depend on one or
the other of these properties (continuous density or finite number of
levels) to measure the dependency between observations, and will likely
struggle to give an unbiased estimation on this type of variable
{{<cite "seok_mutual_2015;boeken_bayesian_2020;gao_estimating_2017;zeng_jackknife_2018">}}.
Another problematic distribution is the *mixture random variable*, which
is itself a mixture of discrete and continuous parts. A prominent
example of this would be a distribution bounded by a minimum value
before a certain threshold, and a continuous function of $x$ after it.
In such a case the \"minimum value\" $x_{min}$ can be seen as the
discrete part of the distribution as $p(x_{min}) > 0$, with the rest
behaving like a continuous variable. Real-life examples include the
values produced by real-time quantitative polymerase chain reaction
(RT-qPCR), used to measure the levels of of messenger RNAs in a cell.
One can view the data produced by RT-qPCR as
$(A(x)~ \text{if}~ x > \text{threshold},~ \text{else } 0)$ with $x$ the
level of mRNA in the cell and $A$ the amplification process. Another
straightforward example is the ReLU activation function
$f(x) = \max(0,x)$ widely used as an activation function in artificial
neural networks (Fig

{{< figure src="/media/relu.svg" title="The output of the ReLU function is a mixture : it has $p(0) > 0$ and is continuous for $x>0$" width="50%" align="center" >}}

The ReLU function was actually discussed recently in the context of
mutual information, and the problems that classical estimators face with
such zero-inflated distribution. Naftali Tishby was a prominent computer
scientist and physicist, who also contributed to signal processing and
tried to apply information-theoretic concepts to gain intuition on deep
learning algorithms. With Pereira and Bialek, he proposed the
Information Bottleneck framework, a self-described *surprisingly rich
framework for discussing a variety of problems in signal processing and
learning* with information theory {{<cite "tishby_information_2000">}}. Put
simply, the idea of the Information Bottleneck is to \"squeeze\" a
signal $X$ to a compressed representation $T$ while minimizing the loss
of information with another relevant variable $Y$ :
$$\min_{p(t|x)} \left\\{ \operatorname{I}(X;T) - \beta\operatorname{I}(T;Y)\right\\}$$
With the Lagrange multiplier $\beta$ for controlling how much loss we
can tolerate when predicting $Y$ from $T$ as opposed to $X$ (recall the
DPI principle, since $Y \rightarrow X \rightarrow T$ is a Markov chain,
$\operatorname{I}(X;Y) \geq \operatorname{I}(T;Y)$). By minimizing this
difference, we want to reduce $X$ to the only part that is relevant to
$Y$, discarding the rest. This very general framework provides an
elegant, if unpractical, solution to the majority of modern machine
learning which has to learn which aspects of the input $X$ is useful for
predicting $Y$, and which are noise.

As deep learning models gathered success faster than a comprehensive
theory could definitely explain why they work and how they can be
further improved, Shwartz-Ziv and Tishby published new evidence that
they claimed could explain the process of training a deep neural network
{{<cite "tishby_deep_2015">}}. In their experiments, they equated the noisy
encoding $T$ of the information bottleneck to the hidden layers of a
deep neural network (DNN) and measured $\operatorname{I}(X;T)$ and
$\operatorname{I}(T;Y)$ during the training process. Their results
showed that the training process acts in two separate phases : first,
the fitting phase in which the network maximizes
$\operatorname{I}(T;Y)$, and then a compression phase that minimizes
$\operatorname{I}(X;T)$. This was an unprecedented window inside the
\"black box\" of deep learning and could potentially explain how they
train, and most importantly how they are able to generalize. Later
however, more studies were published and seemed to show that the two
phases observed in the original experiment were not in fact an
information-theoretic phenomena, but more of an artefact of how the
mutual information is estimated between the hidden layers and $Y$. Saxe
et al. could not replicate the two phases in other network architectures
from the ones tested in the original study, and in particular no
compression phase was observed when training with linear activation
functions or ReLU {{<cite "saxe_information_2018">}}. In response, Shwartz-Ziv and
Tishby claimed that Saxe et al. had used a weak estimator of mutual
information, and defended their general claim saying that \"when
properly done, there are essentially the same fitting and compression
phases\" on any network. There are however other reasons to believe the
compression phase observed in the original study was more a result of
geometric operations as the weights of the network are trained, and does
not hold so much ground in information theory
{{<cite "goldfeld_estimating_2019;geiger_information_2021">}}. Moreover, the
simple DNNs are no longer used in practice, they are being replaced by
extremely scaled up versions (with too many parameters in hidden layers
for mutual information to ever be estimated) or more sophisticated
architecture involving different training mechanisms like transfer
learning, attention mechanisms etc\... diverging from the simple picture
of training that was examined.

We may not know the final word on the information bottleneck for deep
learning, but it serves as a cautionary tale when we want to rely on
mutual information estimates on big data (as the dimension of $X$ gets
large) and the distributions are unfamiliar. It is fortunately not the
case for constraint based causal discovery approaches, where $X$ and $Y$
are usually one-dimensional, and the conditioning set $Z$
*few-dimensional*. Moreover, recent advances were made to better
understand mutual information estimators, including on such mixed
distributions, as will be discussed in a future post.

It is not obvious if we are still allowed to swap differential entropy
for entropy when considering the mixed case. Crucially, it is not well
defined for mixture distribution which are defined neither by a
probability density function nor a mass function alone.

Recent efforts to estimate the mutual information in this general
setting have relied on the Radon--Nikodym theorem. With $P_{XY}$ a
probability measure on the space $\mathcal{X} \times \mathcal{Y}$,
$\mathcal{X}$ and $\mathcal{Y}$ being Euclidean spaces. If $P_{XY}$ is
absolutely continuous with relation to $P_X P_Y$ :
$$\operatorname{I}(X;Y) = \int_{\mathcal{X}\times \mathcal{Y}} log \frac{dP_{XY}}{dP_X P_Y}dP_{XY},$$
where $\frac{dP_{XY}}{dP_X P_Y}$ is the Radon-Nikodym derivative. Note
the only condition this definition is absolute continuity of $P_{XY}$,
and if true it applies for all cases mentioned so far : $X$ and $Y$ are
the same type of variable, $X$ or $Y$ is discrete and the other is
continuous, or $X$, $Y$ or the joint distribution is a mixture itself.
Moreover, the Radon-Nikodym derivative is computable in practice
{{<cite "gao_estimating_2017">}}.

Another way to deal with mixtures is to refer to the master definition of mutual information {{<cite "cover_elements_2012">}}. For two random variables $X$ and $Y$ discretized with partitions $\mathcal{P}$ and $\mathcal{Q}$ :

$$
    \operatorname{I}(X;Y) = \sup_{\mathcal{P},\mathcal{Q}} \operatorname{I}([X]\_{\mathcal{P}};[Y]\_{\mathcal{Q}})
$$

where the supremum is over all finite partitions $\mathcal{P}$ and
$\mathcal{Q}$. It is called the master definition as it always applies,
regardless of the nature of the marginal and joint distributions. For
discrete variables it is simply equivalent to the definition of mutual
information, *i.e.* the partitions are fixed. For
continuous variables, the supremum is obtained by refining $\mathcal{P}$
and $\mathcal{Q}$ into finer and finer bins, monotonically increasing
$\operatorname{I}({[X]}\_\mathcal{P};{[Y]}\_\mathcal{Q}) \nearrow$. When
$N \rightarrow \infty$, this quantity tends to the real value of the
mutual information (just as the entropy of a discretized variable is
approached as the numbers of bins tends to infinity). On a finite sample
size however, adding bins to $\mathcal{P}$ and $\mathcal{Q}$ will
inevitably end up overestimating the mutual information, to the limit of
having one unique value per bin for which (which results in
$\operatorname{I}(X;Y)=log(N)$). In the next post, I will review previous work on choosing the
appropriate number of bins to estimate $\operatorname{I}$ on continuous
data and in another, I will introduce our solution based on the
master definition.

As a general rule, methods that assume a continuous probability density
function $p(x,y)$ over the domain of $X$ and $Y$ tend to not work well
in the mixed case. Any dependence measure having this assumption will
need to be adapted (with more or less difficulty), which may also affect
the way we can evaluate its significativity for independence testing. On
the other hand, one can still rely on the cumulative distribution
function, which is well behaved even for mixture variables (although may
not be smooth). For example, decision-tree-based algorithms like random
forests and gradient boosting work well with such mixtures (although
they are not adapted to all cases, for example they do not deal well
with non-ordinal categorical variables with many levels).

Mutual information is one of the rare measures fit to deal with such
distributions, all while keeping its desirable properties. Particularly,
its strict equivalence with variable independence (and conditional
independence), and its self-equitability property make it ideal for a
general case constraint-based algorithm for causal inference. In the
next subsection we show the equivalences between information theoretic
measures and \"constraints\" in the causal diagrams.

## Bibliography {#bibliography .unnumbered}

{{< bibliography cited >}}


